import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  _Object
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ObjectId } from "mongoose";
import User from "../../db/models/user";

const s3: S3Client = new S3Client();
const bucket = process.env.BUCKET;

export const uploadToS3 = async (file: any, userId: ObjectId) => {
  const user = await User.findById(userId);

  if (user?.pfpId) {
    const rmvCommand = new DeleteObjectCommand({
      Bucket: bucket,
      Key: user?.pfpId
    });
    try {
      await s3.send(rmvCommand);
      console.log("removed old image");
    } catch (error) {
      console.log(error);
      return { error };
    }
  }

  const key = `${userId.toString()}/${Date.now()}-${file.originalname}`;
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  });

  try {
    await s3.send(command);
    console.log("uploaded successfully");
    return { key };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const getAllUsersImages = async (userId: ObjectId) => {
  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: userId.toString()
  });

  let { Contents = [] } = await s3.send(command);

  return Contents.map(content => content.Key);
};

export const getUserPFP = async (userId: ObjectId) => {
  try {
    const imageKeys = await getAllUsersImages(userId);

    if (!imageKeys.length) return { error: "No images found" };

    const foundUser = await User.findById(userId);
    let currentKey: Array<string | undefined> | string | undefined =
      await Promise.all(
        imageKeys.filter(key => {
          if (foundUser?.pfpId === key) return key;
        })
      );

    if (currentKey.length > 1)
      return {
        error: `More than one profile picture found for user with name ${currentKey[0]}`
      };

    currentKey = currentKey[0];

    if (!currentKey)
      return {
        error: `No profile photo found for user with name ${foundUser?.pfpId}`
      };

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: currentKey
    });

    //Signed URL expires in 2 hours
    return getSignedUrl(s3, command, { expiresIn: 2 * 60 * 60 });
  } catch (error) {
    console.log(error);
    return { error };
  }
};
