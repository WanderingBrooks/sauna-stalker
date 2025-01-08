let fullRunLog = '';

const log = (message: string) => {
  fullRunLog += message + '\n';

  return console.log(message);
};

export default log;
export { fullRunLog };
