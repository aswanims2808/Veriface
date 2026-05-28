
import os
import urllib.request
import sys

def download_weights():
    # URL for a pre-trained Xception model (trained on FaceForensics++)
    # Note: Using a widely available re-hosted weight file or the official one if accessible directly. 
    # For this implementation, we'll use a placeholder URL or a known reliable source. 
    # Since direct hotlinking to the official 1.5GB dataset/models zip is often restricted or slow, 
    # we will use the specific Xception ImageNet weights as a base which is standard if FF++ specific ones aren't locally available,
    # OR ideally, the user should provide the FF++ specific .pth file.
    
    # However, to be helpful, let's try to download a compatible model if we can, or at least the ImageNet one to start.
    # The best approach for a robust "start from scratch" is to use the ImageNet weights and let the user know 
    # they can replace it with finetuned ones. 
    
    # Let's use the ImageNet one as a safe default that GUARANTEES the code runs, 
    # while printing instructions for the FF++ one.
    
    url = "http://data.lip6.fr/cadene/pretrainedmodels/xception-43020ad28.pth"
    dest_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
    dest_path = os.path.join(dest_dir, "xception-43020ad28.pth")

    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)

    if os.path.exists(dest_path):
        print(f"Weights already exist at {dest_path}")
        return

    print(f"Downloading weights from {url}...")
    print("NOTE: These are ImageNet pre-trained weights. For optimal Deepfake detection,")
    print("      please replace this file with 'faceforensics++_models_subset/full/xception/full_c23.p'")
    print("      from the official FaceForensics++ dataset if you have access.")
    
    try:
        def reporthook(blocknum, blocksize, totalsize):
            readso_far = blocknum * blocksize
            if totalsize > 0:
                percent = readso_far * 1e2 / totalsize
                s = "\r%5.1f%% %*d / %d" % (
                    percent, len(str(totalsize)), readso_far, totalsize)
                sys.stdout.write(s)
                if readso_far >= totalsize: # near the end
                    sys.stdout.write("\n")
        
        urllib.request.urlretrieve(url, dest_path, reporthook)
        print("Download complete.")
    except Exception as e:
        print(f"Failed to download weights: {e}")

if __name__ == "__main__":
    download_weights()
