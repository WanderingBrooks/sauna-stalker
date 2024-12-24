# sauna-stalker

## Install

1. `nvm use`
2. `npm install`

## Run

- `npm run dev`

## Build

1. `npm run build`
2. `npm run start`

## Run on raspberry pi

1. Install chromium `sudo apt install chromium-browser chromium-codecs-ffmpeg`
2. Install packages `npm install`
3. Build `npm run build`
4. Open crontab `crontab -e`
5. Add your a line that will run this job. `* * * * * (. ~/Desktop/sauna-stalker/cronjob.env.sh; ~/Desktop/sauna-stalker/script.sh)`

- For example I currently have `0,15,31,45 7-22 * * * (. ~/Desktop/sauna-stalker/cronjob.env.sh; ~/Desktop/sauna-stalker/script.sh)`.
  - For two reasons,
    1. I want to know if any evening slots open up so I want it to run often.
    2. At 31 minutes because after 30 minutes if a slot was not used it's opened for everyone so this will alert if we can nab a slot someone didn't use.

6. Logs should end up in `~/Desktop/sauna-stalker/file.log`
