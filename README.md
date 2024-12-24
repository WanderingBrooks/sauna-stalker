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
6. Logs should end up in `~/Desktop/sauna-stalker/file.log`
