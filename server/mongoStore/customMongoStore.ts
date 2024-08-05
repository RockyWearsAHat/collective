import MongoStore from "connect-mongo";

export class CustomMongoStore extends MongoStore {
  private onDestroy: (sid: string) => void;

  constructor(options: any & { onDestroy?: (sid: string) => void }) {
    super(options);
    this.onDestroy = options.onDestroy || (() => {});
  }

  destroy(sid: string, callback?: (err?: any) => void): void {
    super.destroy(sid, err => {
      if (!err) {
        this.onDestroy(sid);
      }
      if (callback) callback(err);
    });
  }
}
