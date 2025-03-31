import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  _Object
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mongoose, { ObjectId } from "mongoose";
import { User } from "../../db/models/user";
import { Item } from "../../db/models/item";

const s3: S3Client = new S3Client({
  region: process.env.DEFAULT_REGION!,
  credentials: {
    accessKeyId: process.env.ENV_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.ENV_AWS_SECRET_ACCESS_KEY!
  }
});
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
    } catch (error) {
      console.log(error);
      return { error };
    }
  }

  const key = `${userId.toString()}/${Date.now()}-${file.originalname.replaceAll("/", "")}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  });

  try {
    await s3.send(command);
    return { key };
  } catch (error) {
    console.log(error);
    return { error };
  }
};

const getAllImages = async (id: ObjectId) => {
  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: id.toString()
  });

  let { Contents = [] } = await s3.send(command);

  return Contents.map(content => content.Key);
};

export const getUserPFP = async (userId: ObjectId) => {
  try {
    const foundUser = await User.findById(userId);

    if (!foundUser) return { error: "User not found" };

    if (!mongoose.Types.ObjectId.isValid(foundUser.pfpId.split("/")[0])) {
      return `/defaultPFPs/default${foundUser.pfpId}.jpg`;
    }

    const imageKeys = await getAllImages(userId);

    if (!imageKeys.length) return { error: "No images found" };

    let currentKey: Array<string | undefined> | string | undefined = await Promise.all(
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

export const uploadProductImagesToS3 = async (files: any[], itemId: ObjectId): Promise<any> => {
  files.forEach(async file => {
    const key = `${itemId.toString()}/${Date.now()}-${file.originalname.replaceAll("/", "")}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype
    });

    try {
      await s3.send(command);
      return { key };
    } catch (error) {
      console.log(error);
      return { error };
    }
  });
};

export const getProductImages = async (productId: ObjectId, _imagesToGet?: Number) => {
  try {
    const foundProduct = await Item.findById(productId);

    if (!foundProduct) return { error: "Product not found" };

    const imageKeys = await getAllImages(productId);

    if (!imageKeys.length) return { error: "No images found" };

    let currentKey: Array<string | undefined> | string | undefined = await Promise.all(
      imageKeys.filter(key => {
        if (key && foundProduct?.imageLinks?.includes(key)) return key;
      })
    );

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: currentKey[0]
    });

    //Signed URL expires in 48 hours (prevents unnecessary fetching ideally)
    return getSignedUrl(s3, command, { expiresIn: 2 * 24 * 60 * 60 });
  } catch (error) {
    console.log(error);
    return { error };
  }
};
