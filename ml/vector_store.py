import pandas as pd
import os

past_projects = []


def load_past_projects():
    """
    Loads past project dataset safely.
    Works even if abstract column does not exist.
    """

    global past_projects

    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(BASE_DIR, "data", "past_projects.csv")

    if not os.path.exists(csv_path):
        print("âŒ past_projects.csv not found!")
        return

    df = pd.read_csv(csv_path)

    # âœ… Ensure required column exists
    if "project" not in df.columns:
        raise ValueError("CSV must contain a 'project' column")

    # âœ… Add missing url column if not present
    if "url" not in df.columns:
        df["url"] = ""

    # âœ… No abstract needed
    past_projects = df.to_dict(orient="records")

    print("âœ… Past Projects Loaded Successfully:", len(past_projects))


def get_projects():
    return past_projects
