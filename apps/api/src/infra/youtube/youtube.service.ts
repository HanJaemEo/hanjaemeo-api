import fs from 'node:fs';
import ytdl from '@distube/ytdl-core';
import { Injectable, Logger } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);

  async saveVideoStreamToFile(url: string): Promise<string> {
    const videoInfo = await this.getVideoInfo(url);

    const downloadedPath = this.isAlreadyDownloaded(videoInfo.videoDetails.videoId)
      ? `./tmp/${videoInfo.videoDetails.videoId}.mp4`
      : await this.getSoundOnlyVideoStream(videoInfo);

    const audioFilePath = this.isAlreadyConverted(videoInfo.videoDetails.videoId)
      ? `./tmp/${videoInfo.videoDetails.videoId}.mp3`
      : await this.convertToMp3(downloadedPath, videoInfo.videoDetails.videoId);

    return audioFilePath;
  }

  private async getVideoInfo(url: string) {
    const videoInfo = await ytdl.getInfo(url);

    return videoInfo;
  }

  private isAlreadyDownloaded(id: string): boolean {
    const downloaded = fs.existsSync(`./tmp/${id}.mp4`);

    return downloaded;
  }

  private async getSoundOnlyVideoStream(videoInfo: ytdl.videoInfo): Promise<string> {
    const stream = await ytdl
      .downloadFromInfo(videoInfo, {
        filter: 'audioonly',
        requestOptions: {
          reset: true,
        },
      })
      .pipe(fs.createWriteStream(`./tmp/${videoInfo.videoDetails.videoId}.mp4`));

    this.logger.debug(`Downloaded: ${videoInfo.videoDetails.videoId}`);

    return stream.path as string;
  }

  private isAlreadyConverted(id: string): boolean {
    const downloaded = fs.existsSync(`./tmp/${id}.mp3`);

    return downloaded;
  }

  private async convertToMp3(inputPath: string, id: string): Promise<string> {
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputFormat('mp3')
        .on('end', () => {
          resolve(void undefined);
        })
        .on('error', error => {
          reject(error);
        })
        .save(`./tmp/${id}.mp3`);
    });

    this.logger.debug(`Converted to mp3: ${id}`);

    return `./tmp/${id}.mp3`;
  }
}
