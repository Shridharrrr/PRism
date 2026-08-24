import yaml
from typing import Optional

DEFAULT_CONFIG = {
    "review": {
        "auto_approve_if_no_critical": True,
        "comment_on_every_file": False,
        "critical_threshold": 1,
        "tone": "professional",  # professional, friendly, concise
        "include_code_suggestions": True,
        "include_explanations": True,
        "enable_interactive_responses": True,
        "response_wait_time": 2,
    },
    "ignore_patterns": [
        "*.test.js",
        "*.test.ts",
        "*.spec.js",
        "*.spec.ts",
        "**/__tests__/**",
        "**/__mocks__/**",
        "**/test/**",
        "**/tests/**",
    ],
    "focus_areas": [
        "security",
        "performance",
        "best_practices",
        "error_handling",
    ]
}


def parse_prism_config(yaml_content: Optional[str]) -> dict:
    """
    Parse .prism.yaml configuration file with validation and defaults.

    Args:
        yaml_content: Raw YAML content from .prism.yaml file

    Returns:
        Parsed config dict with defaults applied
    """
    if not yaml_content:
        return DEFAULT_CONFIG.copy()

    try:
        config = yaml.safe_load(yaml_content)
        if not isinstance(config, dict):
            print("Warning: .prism.yaml is not a valid dict, using defaults")
            return DEFAULT_CONFIG.copy()

        # Merge with defaults
        merged_config = DEFAULT_CONFIG.copy()

        # Merge review settings
        if "review" in config and isinstance(config["review"], dict):
            merged_config["review"].update(config["review"])

        # Override ignore_patterns if provided
        if "ignore_patterns" in config and isinstance(config["ignore_patterns"], list):
            merged_config["ignore_patterns"] = config["ignore_patterns"]

        # Override focus_areas if provided
        if "focus_areas" in config and isinstance(config["focus_areas"], list):
            merged_config["focus_areas"] = config["focus_areas"]

        # Validate tone
        valid_tones = ["professional", "friendly", "concise"]
        if merged_config["review"]["tone"] not in valid_tones:
            print(f"Warning: Invalid tone '{merged_config['review']['tone']}', using 'professional'")
            merged_config["review"]["tone"] = "professional"

        # Validate thresholds
        if not isinstance(merged_config["review"]["critical_threshold"], int) or \
           merged_config["review"]["critical_threshold"] < 0:
            print("Warning: Invalid critical_threshold, using default 1")
            merged_config["review"]["critical_threshold"] = 1

        # Validate response_wait_time
        if not isinstance(merged_config["review"]["response_wait_time"], (int, float)) or \
           merged_config["review"]["response_wait_time"] < 0:
            print("Warning: Invalid response_wait_time, using default 2")
            merged_config["review"]["response_wait_time"] = 2

        return merged_config

    except yaml.YAMLError as e:
        print(f"Error parsing .prism.yaml: {e}")
        return DEFAULT_CONFIG.copy()
    except Exception as e:
        print(f"Unexpected error parsing config: {e}")
        return DEFAULT_CONFIG.copy()


def should_ignore_file(file_path: str, ignore_patterns: list) -> bool:
    """
    Check if a file should be ignored based on patterns.

    Args:
        file_path: File path to check
        ignore_patterns: List of glob patterns from config

    Returns:
        True if file should be ignored
    """
    import fnmatch

    for pattern in ignore_patterns:
        if fnmatch.fnmatch(file_path, pattern):
            return True
    return False


def get_review_state_from_flags(flags: list, config: dict) -> str:
    """
    Determine GitHub review state based on flags and config.

    Args:
        flags: List of parsed flags with severity
        config: Parsed .prism.yaml config

    Returns:
        "APPROVE", "REQUEST_CHANGES", or "COMMENT"
    """
    critical_threshold = config.get("review", {}).get("critical_threshold", 1)
    auto_approve = config.get("review", {}).get("auto_approve_if_no_critical", True)

    critical_count = sum(1 for f in flags if f.get("severity") == "critical")

    if critical_count >= critical_threshold:
        return "REQUEST_CHANGES"
    elif len(flags) == 0 and auto_approve:
        return "APPROVE"
    elif len(flags) > 0:
        return "COMMENT"
    else:
        return "COMMENT"


def filter_flags_by_config(flags: list, config: dict) -> list:
    """
    Filter flags based on ignore patterns and focus areas.

    Args:
        flags: List of parsed flags
        config: Parsed .prism.yaml config

    Returns:
        Filtered list of flags
    """
    ignore_patterns = config.get("ignore_patterns", [])
    focus_areas = config.get("focus_areas", [])

    filtered = []
    for flag in flags:
        file_path = flag.get("file_path")

        # Skip if file matches ignore pattern
        if file_path and should_ignore_file(file_path, ignore_patterns):
            continue

        # If focus_areas is specified, only include relevant flags
        # Map agent types to focus areas
        agent = flag.get("agent", "")
        flag_type = flag.get("type", "")

        if focus_areas:
            include_flag = False

            # Security auditor maps to "security" focus
            if "security" in focus_areas and agent == "security_auditor":
                include_flag = True

            # Performance-related flags
            if "performance" in focus_areas and any(kw in flag_type for kw in ["performance", "efficiency", "optimization", "n+1"]):
                include_flag = True

            # Best practices
            if "best_practices" in focus_areas and any(kw in flag_type for kw in ["naming", "complexity", "duplication", "best-practice"]):
                include_flag = True

            # Error handling
            if "error_handling" in focus_areas and any(kw in flag_type for kw in ["error", "exception", "validation"]):
                include_flag = True

            # If no focus area matched, skip this flag
            if not include_flag:
                continue

        filtered.append(flag)

    return filtered
