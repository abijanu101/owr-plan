import sys
import os

try:
    import PyPDF2
    def extract_text(pdf_path):
        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text
except ImportError:
    try:
        import fitz # PyMuPDF
        def extract_text(pdf_path):
            doc = fitz.open(pdf_path)
            text = ""
            for page in doc:
                text += page.get_text() + "\n"
            return text
    except ImportError:
        def extract_text(pdf_path):
            return "Neither PyPDF2 nor PyMuPDF installed."

def main():
    dir_path = r"e:\Coding\Projects\owr-plan\frontend\_tmp"
    for file in os.listdir(dir_path):
        if file.endswith(".pdf"):
            path = os.path.join(dir_path, file)
            with open("output.txt", "a", encoding="utf-8") as out:
                out.write(f"--- File: {file} ---\n")
                out.write(extract_text(path)[:5000])
                out.write("\n\n")

if __name__ == "__main__":
    main()
