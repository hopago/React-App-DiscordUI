import { HttpException } from "../middleware/error/utils.js";
import User, { IUser } from "../models/User.js";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { IFriends } from "./type/friends";

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user.id;
  try {
    const user = await User.findOne({
      _id: userId,
    })
      .select("-password")
      .lean();
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user.id;
  try {
    const { userName, description, language, avatar, password, banner } =
      req.body;
    if (!userName) return res.sendStatus(400);

    const user = await User.findById(userId).exec();
    if (!user) return res.sendStatus(404);

    user.userName = userName;
    user.description = description;
    user.language = language;

    if (avatar) {
      user.avatar = avatar;
    }
    if (banner) {
      user.banner = banner;
    }
    if (password) {
      user.password = bcrypt.hashSync(password, 10);
    }

    const updatedUser = await user.save();

    const {
      password: sortedPassword,
      refreshToken,
      type,
      ...updatedUserInfo
    } = updatedUser._doc;

    res.status(201).json(updatedUserInfo);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user.id;
  try {
    if (!userId) throw new HttpException(400, "User Id required...");

    const user = await User.findById(userId).exec();
    if (!user) throw new HttpException(404, "User not found...");

    const result = await user.deleteOne();

    res
      .status(200)
      .json(`UserName: ${result.userName} witt Id ${result._id} deleted...`);
  } catch (err) {
    next(err);
  }
};

export const findUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.userId;
  try {
    if (!userId || userId === "undefined") return res.sendStatus(400);

    const user = await User.findOne({
      _id: userId,
    })
      .select("-password")
      .lean();
    if (!user) res.sendStatus(404);

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

export const getFriends = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user.id;
  try {
    if (!userId)
      throw new HttpException(403, "Something went wrong in verifying...");

    const user = await User.findById(userId).exec();
    if (!user) throw new HttpException(404, "User not found...");

    const getAllPromise = <T>(promises: Promise<T>[]) => Promise.all(promises);
    const getAllFriends = user?.friends.map((friendId: string) =>
      User.findById(friendId)
    );
    const friends = await getAllPromise(getAllFriends);

    let friendList: object[] = [];
    friends.map((friend) => {
      const { _id, userName, avatar, description, language } =
        friend as IFriends;
      friendList.push({ _id, userName, avatar, description, language });
    });

    res.status(200).json(friendList);
  } catch (err) {
    next(err);
  }
};

export const getSingleFriend = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentUserId = req.user.id;
  const friendId = req.params.friendId;
  try {
    const user = await User.findById(currentUserId);
    if (!user) throw new HttpException(404, "User not found...");

    const friend: IUser[] = user.friends.filter((friend: IFriends) => {
      return friend._id === friendId;
    });

    const { password, ...friendInfo } = friend[0];

    res.status(200).json(friendInfo);
  } catch (err) {
    next(err);
  }
};

export const removeFriend = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentUserId = req.user.id;
  const friendId = req.params?.friendId;
  try {
    const currentUser = await User.findById(currentUserId);
    const friend = await User.findById(friendId);

    if (!currentUser?.friends.includes(friend as never)) {
      await currentUser?.updateOne({
        $pull: {
          friends: friend,
        },
      });
      res.sendStatus(201);
    } else {
      throw new HttpException(500, "Something went wrong...");
    }
  } catch (err) {
    next(err);
  }
};
