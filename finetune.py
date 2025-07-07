import os
import json
import re
from datetime import datetime
from dataclasses import dataclass, field
from typing import Dict, Optional

import numpy as np
import torch
import evaluate 
import argparse
from typing import Dict

from datasets import load_dataset, DatasetDict, ClassLabel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from transformers.training_args import TrainingArguments
from transformers.trainer import Trainer



def get_timestamp() -> str:
    return datetime.now().strftime("%Y%m%d_%H%M%S")

def tokenize_batch(batch, tokenizer, max_length=128):
    return tokenizer(
        batch["text"],
        padding="max_length",
        truncation=True,
        max_length=max_length,
    )
    
@dataclass
class ModelArguments:
    model_name_or_path: str = field(
        metadata={"help": "Pre-trained model checkpoint or model identifier."}
    )
    version: Optional[str] = field(
        default=None,
        metadata={"help": "Version tag for this run; auto-generated if not set."}
    )
    
@dataclass
class DataArguments:
    dataset_name: str = field(
        metadata={"help": "Hugging Face dataset ID, e.g. papluca/language-identification."}
    )
    max_seq_length: int = field(
        default=128,
        metadata={"help": "Max sequence length for tokenization."}
    )

accuracy = evaluate.load("accuracy")

def compute_metrics(pred):
    """This helper function computes the accuracy metric by comparing model predictions to true labels"""
    preds = np.argmax(pred.predictions, axis=1)
    results: Dict[str, float] = accuracy.compute(
        predictions=preds, references=pred.label_ids
    ) # type: ignore
    return results

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="google-bert/bert-base-multilingual-cased")
    parser.add_argument("--data", default="papluca/language-identification")
    parser.add_argument("--version", default=None)
    parser.add_argument("--output_dir",    default="./models")
    parser.add_argument("--lr", type=float, default=2e-5)
    parser.add_argument("--num_epochs", type=int, default=3)
    parser.add_argument("--train_batch_size", type=int, default=16)
    parser.add_argument("--eval_batch_size", type=int, default=16)
    parser.add_argument("--weight_decay", type=float, default=0.01)
    args = parser.parse_args()
    base_dir = args.output_dir
    os.makedirs(base_dir, exist_ok=True)
    
    # Create directory for this version
    if args.version:
        version = args.version
    else:
        existing = []
        for name in os.listdir(base_dir):
            m = re.match(r"^(\d+)_", name)
            if m:
                existing.append(int(m.group(1)))
        next_num = max(existing) + 1 if existing else 1
        version = f"{next_num}_{get_timestamp()}"
    output_dir = os.path.join(base_dir, version)
    os.makedirs(output_dir, exist_ok=True)
    
    # Device setup
    device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
    
    # Load dataset
    dataset: DatasetDict = load_dataset(args.data) # type: ignore
    label_names = sorted(dataset["train"].unique("labels"))
    dataset     = dataset.cast_column("labels", ClassLabel(names=label_names))
    label_names = dataset["train"].features["labels"].names
    num_labels = len(label_names)

    # Tokenizer and preprocessing
    tokenizer = AutoTokenizer.from_pretrained(args.model)
    tokenized = dataset.map(
        lambda batch: tokenize_batch(batch, tokenizer),
        batched=True,
        remove_columns=["text"],
    )
    tokenized = tokenized.rename_column("labels", "label")
    tokenized.set_format("torch", columns=["input_ids", "attention_mask", "label"])

    
    # Model initilization
    model = AutoModelForSequenceClassification.from_pretrained(
        args.model,
        num_labels=num_labels,
        id2label={i: lbl for i, lbl in enumerate(label_names)},
        label2id={lbl: i for i, lbl in enumerate(label_names)},
    )
    model.to(device)
 
    # Training arguments
    training_args = TrainingArguments(
        output_dir="./results",
        eval_strategy="epoch", 
        learning_rate=args.lr, 
        per_device_train_batch_size=args.train_batch_size,
        per_device_eval_batch_size=args.eval_batch_size,
        num_train_epochs=args.num_epochs,
        weight_decay=args.weight_decay,
    )
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized["train"],
        eval_dataset=tokenized["validation"],
        processing_class=tokenizer,
        compute_metrics=compute_metrics,
    )
    
    # Train and save
    trainer.train()
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    
    metrics = trainer.evaluate()
    # Metadata
    metadata = {
        "model_name": args.model,
        "dataset": args.data,
        "version": version,
        "training_args": vars(args),
        "metrics": metrics,
        "timestamp": datetime.now().isoformat(),
    }
    with open(os.path.join(output_dir, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Saved fine-tuned model to {output_dir}")
    metrics = trainer.evaluate()
    print("\n=== Smoke-Test Eval Metrics ===")
    for k, v in metrics.items():
        print(f"{k}: {v:.4f}")
    
    
    print(f"Saved fine-tuned model to {output_dir}")

if __name__ == "__main__":
    main()
    
