from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

def hash_password(password: str) -> str:
    """
    Hashes a plaintext password using bcrypt.

    Args:
        password (str): The plaintext password to hash.

    Returns:
        str: The hashed password.
    """
    return bcrypt.generate_password_hash(password).decode('utf-8')


def validate_password(plaintext_password: str, hashed_password: str) -> bool:
    """
    Validates a plaintext password against a hashed password.

    Args:
        plaintext_password (str): The plaintext password to validate.
        hashed_password (str): The hashed password to compare against.

    Returns:
        bool: True if the password is valid, False otherwise.
    """
    return bcrypt.check_password_hash(hashed_password, plaintext_password)
