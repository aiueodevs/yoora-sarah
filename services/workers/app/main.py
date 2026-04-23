import os


def main() -> None:
    queue_name = os.getenv("YOORA_QUEUE_NAME", "default")
    print(f"Worker scaffold ready. Queue: {queue_name}")


if __name__ == "__main__":
    main()
