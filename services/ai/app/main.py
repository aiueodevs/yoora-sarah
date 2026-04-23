import os


def main() -> None:
    prompt_version = os.getenv("YOORA_PROMPT_VERSION", "v1")
    print(f"AI service scaffold ready. Prompt baseline: {prompt_version}")


if __name__ == "__main__":
    main()
