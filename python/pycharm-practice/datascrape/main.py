from pytube import YouTube
import librosa, numpy as np, json
yt = YouTube("https://www.youtube.com/watch?v=tAGnKpE4NCI")
stream = yt.streams.filter(only_audio=True).first()
stream.download(filename="audio.mp3")


y, sr = librosa.load("audio.mp3", sr=None)

# Hızlı Fourier Dönüşümü (FFT)
fft = np.fft.fft(y)
freqs = np.fft.fftfreq(len(fft), 1/sr)

# Yalnızca pozitif frekansları al
magnitude = np.abs(fft[:len(fft)//2])
freqs = freqs[:len(freqs)//2]

# JSON olarak biçimlendir
data = [{"freq_hz": float(f), "amplitude": float(a)} for f, a in zip(freqs, magnitude)]

with open("frekanslar.json", "w") as f:
    json.dump(data, f, indent=2)
