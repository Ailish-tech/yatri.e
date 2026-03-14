"""
Virtual Tourist Guide — Free AI using Groq (LLaMA 3).
Extremely fast inference, generous free tier.

Setup:
    1. Get API key: https://console.groq.com/keys
    2. pip install groq
    3. Set key: export GROQ_API_KEY="your-key-here"
       Or on Windows: set GROQ_API_KEY=your-key-here
"""

import os
from groq import Groq

# ─── Configuration ────────────────────────────────────────────
API_KEY = os.environ.get("GROQ_API_KEY", "")

if not API_KEY:
    print(
        "\n⚠️  GROQ_API_KEY not set!\n"
        "   Get your free key at: https://console.groq.com/keys\n"
        "   Then run:  set GROQ_API_KEY=your-key-here  (Windows)\n"
        "              export GROQ_API_KEY=your-key-here  (Mac/Linux)\n"
    )

client = Groq(api_key=API_KEY) if API_KEY else None

MODEL_NAME = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = (
    "You are a highly knowledgeable and friendly local tourist guide. "
    "Keep your answers concise, helpful, and focused on local history, "
    "safety, and culture. If the user asks about a dangerous area or "
    "safety concern, provide practical safety tips. If asked about local "
    "food, crafts, or attractions, share enthusiastic recommendations. "
    "Always be welcoming and positive about local culture."
)


# ─── Core Chat Function ──────────────────────────────────────
def chat_with_virtual_guide(
    user_message: str,
    conversation_history: list[dict] | None = None,
) -> str:
    """
    Chat with Groq LLaMA acting as a tourist guide.

    Args:
        user_message: The tourist's question.
        conversation_history: Optional list of previous messages.
            Each dict: {"role": "user"|"assistant", "content": "..."}

    Returns:
        The guide's response text.

    Raises:
        ConnectionError: If API key is missing or API unreachable.
        RuntimeError: If Groq returns an error.
    """

    if not API_KEY or not client:
        raise ConnectionError(
            "GROQ_API_KEY not set. Get your free key at: "
            "https://console.groq.com/keys"
        )

    try:
        # Build messages list
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        if conversation_history:
            for msg in conversation_history:
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"],
                })

        messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )

        return response.choices[0].message.content

    except Exception as e:
        error_msg = str(e).lower()
        if "api key" in error_msg or "401" in error_msg or "invalid" in error_msg:
            raise ConnectionError(
                f"Groq API key error: {e}\n"
                "Get a valid key at: https://console.groq.com/keys"
            ) from e
        if "rate" in error_msg or "429" in error_msg:
            raise RuntimeError(
                "Groq rate limit reached. Wait a moment and try again."
            ) from e
        raise RuntimeError(f"Groq API error: {e}") from e


# ─── Helper Functions ─────────────────────────────────────────
def generate_safety_report(lat: float, lon: float, area_name: str = "") -> str:
    """
    Generate an AI safety assessment for a location.

    Args:
        lat: Latitude.
        lon: Longitude.
        area_name: Optional area name for better context.

    Returns:
        Structured safety report as text.
    """

    prompt = (
        f"I am a tourist visiting the area at coordinates ({lat}, {lon})"
        f"{f', known as {area_name}' if area_name else ''}. "
        "Please provide a brief safety assessment with:\n"
        "1. Overall risk level (Low/Medium/High)\n"
        "2. Top 3 safety concerns for tourists\n"
        "3. Three practical safety tips\n"
        "4. Local emergency number\n"
        "Keep it concise and helpful."
    )

    return chat_with_virtual_guide(prompt)


def estimate_crowd_level(place_name: str, day_of_week: str = "", time_of_day: str = "") -> str:
    """
    Estimate crowd level for a place.

    Args:
        place_name: Name of the place.
        day_of_week: e.g. "Monday".
        time_of_day: e.g. "14:00".

    Returns:
        Crowd estimate text with 1-5 rating.
    """

    context = f" on {day_of_week}" if day_of_week else ""
    context += f" at {time_of_day}" if time_of_day else ""

    prompt = (
        f"As a local guide, estimate how crowded '{place_name}' typically is"
        f"{context}. Rate it from 1-5 (1=Empty, 5=Very Crowded) and explain "
        "briefly. Also mention peak hours tourists should avoid."
    )

    return chat_with_virtual_guide(prompt)


# ─── Demo / Self-test ─────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  Virtual Tourist Guide (Groq — LLaMA 3 · Free Tier)")
    print("=" * 60)

    if not API_KEY:
        print("\nCannot run demo without GROQ_API_KEY.")
        print("Set it and try again:")
        print('  set GROQ_API_KEY=your-key-here')
        exit(1)

    # Test 1: Basic chat
    print("\n--- Test 1: Basic Chat ---")
    print("Q: What should I know about visiting Old Delhi?\n")
    try:
        answer = chat_with_virtual_guide(
            "What should I know about visiting Old Delhi as a tourist? Keep it to 3 bullet points."
        )
        print(answer)
        print("\n  PASS: Basic chat works")
    except Exception as e:
        print(f"  FAIL: {e}")

    # Test 2: Safety report
    print("\n--- Test 2: Safety Report ---")
    try:
        report = generate_safety_report(28.6562, 77.2410, "Old Delhi")
        print(report)
        print("\n  PASS: Safety report works")
    except Exception as e:
        print(f"  FAIL: {e}")

    # Test 3: Crowd estimate
    print("\n--- Test 3: Crowd Estimate ---")
    try:
        crowd = estimate_crowd_level("Taj Mahal", "Saturday", "10:00")
        print(crowd)
        print("\n  PASS: Crowd estimate works")
    except Exception as e:
        print(f"  FAIL: {e}")

    print("\n" + "=" * 60)
    print("  All tests complete!")
    print("=" * 60)
