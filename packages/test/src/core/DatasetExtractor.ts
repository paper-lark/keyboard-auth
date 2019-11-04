import { IDataFrame, DataFrame } from 'data-forge';
import { readFileSync } from 'data-forge-fs';
import { KeyboardEvent, KeyboardEventType } from '../typings/common';
import moment from 'moment';
import fs from 'fs';
import path from 'path';

export class DatasetExtractor {
  constructor(
    private readonly dataPath: string,
    private readonly featuresFile: string
  ) {}

  public getUserIds(): string[] {
    return this.getDirectories(this.dataPath);
  }

  public getUserData(userId: string): IDataFrame<number, KeyboardEvent> {
    let resultDF: IDataFrame<number, KeyboardEvent> = new DataFrame<
      number,
      KeyboardEvent
    >();
    for (const deviceType of this.getDirectories(
      path.join(this.dataPath, userId)
    )) {
      for (const sessionId of this.getDirectories(
        path.join(this.dataPath, userId, deviceType)
      )) {
        const filepath = path.join(
          this.dataPath,
          userId,
          deviceType,
          sessionId,
          this.featuresFile
        );
        if (fs.existsSync(filepath)) {
          const df = readFileSync(filepath)
            .parseCSV()
            .parseDates(['time'])
            .parseInts(['keyup'])
            .select<KeyboardEvent>(row => ({
              type:
                row.keyup === 1
                  ? KeyboardEventType.KEYUP
                  : KeyboardEventType.KEYDOWN,
              timestamp: moment(row.time),
              key: row.virtualcode
            }));
          resultDF = resultDF.union(df);
        }
      }
    }

    return resultDF;
  }

  private getDirectories(base: string): string[] {
    return fs
      .readdirSync(base, { withFileTypes: true })
      .filter(f => f.isDirectory())
      .map(f => f.name)
      .sort();
  }
}
