var floor_model = "data:image/jpeg;base64,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";