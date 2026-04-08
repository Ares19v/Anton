import nltk
import textblob.download_corpora as downloader

print("Downloading NLTK and TextBlob data...")
nltk.download('brown')
nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('averaged_perceptron_tagger')
downloader.main()
print("Download complete.")
