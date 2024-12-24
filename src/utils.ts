import fs from 'fs';
import log from './log';

const readJsonFile = async (filePath: string): Promise<unknown | null> => {
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = await fs.promises.readFile(filePath, 'utf-8');

      return JSON.parse(fileContent);
    } else {
      log(`[readJsonFile]: File does not exist: ${filePath}`);

      return null;
    }
  } catch (error) {
    log(`An error occurred while reading the file: ${error}`);

    return null;
  }
};

const writeJsonFile = (fileName: string, fileContents: string) =>
  fs.writeFileSync(fileName, fileContents);

export { readJsonFile, writeJsonFile };
