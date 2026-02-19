
import string
import random

def generate_access_code(length=8):
    """Generate a random alphanumeric access code."""
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(characters) for _ in range(length))
