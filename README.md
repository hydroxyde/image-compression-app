## Getting Started

First, run the development server:

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
## Architecture
Image compression library used for this project can be found [here](https://www.npmjs.com/package/browser-image-compression)

## Limitations

- In the current version, only 1 image can be uploaded at a time. Haven't tested other limitations such as big image size. 

- There is no usage of any DB, could add counter for the total downloads. 