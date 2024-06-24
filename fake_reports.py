import pandas as pd
import random

# Load the existing data
file_path = './data.xlsx'
df = pd.read_excel(file_path)

# Define possible values for each column
gender_options = ["Male", "Female", "Non-Binary"]
age_group_options = ["< 18", "18-25", "> 25"]
alone_options = ["Yes", "No"]
intoxication_signals_options = ["Speech", "Balance", "Co-ordination", "Behavior", "Not Visible"]
escort_options = ["Accommodation", "Transport", "Friends", "Other"]
basic_aid_options = ["Vomit Bag", "Water", "Footwear"]
experience_descriptions = [
    "Had a great time with friends.",
    "The place was too crowded and noisy.",
    "Had a few drinks and felt a bit tipsy.",
    "Felt very safe and enjoyed the night.",
    "Had to leave early due to feeling unwell.",
    "Met new people and had interesting conversations.",
    "Got separated from friends and felt lost.",
    "The music was fantastic but the drinks were overpriced.",
    "Felt uncomfortable due to the behavior of others.",
    "Had a wonderful night out with family."
]

# Generate 100 new rows of data
new_data = {
    "Gender": [random.choice(gender_options) for _ in range(100)],
    "Age Group": [random.choice(age_group_options) for _ in range(100)],
    "Alone": [random.choice(alone_options) for _ in range(100)],
    "Intoxication Signal": [random.choice(intoxication_signals_options) for _ in range(100)],
    "Escort":[random.choice(escort_options) for _ in range(100)],
    "Basic Aid":[random.choice(basic_aid_options) for _ in range(100)],
    "Describe your experience": [random.choice(experience_descriptions) for _ in range(100)]
}

new_df = pd.DataFrame(new_data)

# Concatenate the new data with the existing data
combined_df = pd.concat([df, new_df], ignore_index=True)

# Save the updated data back to Excel
output_file_path = './data.xlsx'
combined_df.to_excel(output_file_path, index=False)
output_file_path
