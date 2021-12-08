# air-drawing 👆

This tool uses Deep Learning to help you draw and write with your hand and webcam. A Deep Learning model is used to try to predict the user intent: whether you want to have stroke ('pencil down') or just move your hand ('pencil up'). Watch the gif until the end to see how it works.

**Try it online : [loicmagne.github.io/air-drawing](https://loicmagne.github.io/air-drawing/)**

![](assets/gif.gif)

## Technical Details

- This pipeline is made up of two steps: detecting the hand, and predicting the drawing. Both steps are done using Deep Learning.
- The handpose detection is performed using [MediaPipe toolbox](https://google.github.io/mediapipe/solutions/hands.html)
- The drawing prediction part uses only the finger position, not the image. The input is a sequence of 2D points (actually i'm using the speed and acceleration of the finger instead of the position to make the prediction translation-invariant), and the output is a binary classification 'pencil up' or 'pencil down'. I used a simple bidirectionnal LSTM architecture. I made a small dataset myself (~50 samples) which I annotated thanks to tools provided in the `python-stuff/data-wrangling/`. At first I wanted to make the 'pencil up'/'pencil down' prediction in real-time, i.e. make the predictions at the same time the user draws. However this task was too difficult and I had poor results, which is why I'm now using bidirectionnal LSTM. You can find details of the deep learning pipeline in the jupyter-notebook in `python-stuff/deep-learning/`
- The application is entirely client-side. I deployed the deep learning model by converting the PyTorch model to .onnx, and then using the [ONNX Runtime](https://github.com/microsoft/onnxruntime) which is very convenient and compatible with a lot of layers.

## Going Forward

Overall the pipeline still struggles and needs some improvement. Ideas of amelioration include :
- Having a bigger dataset, with more diverse user data.
- Process and smooth the finger signal, to be less dependent on camera quality, and to improve model generalization.

Reddit post : https://www.reddit.com/r/MachineLearning/comments/pmqtj9/p_using_deep_learning_to_draw_and_write_with_your/
