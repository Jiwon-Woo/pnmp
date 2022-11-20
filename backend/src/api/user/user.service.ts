import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../core/user/user.entity';
import { UserRepository } from '../../core/user/user.repository';
import { SearchUserDto } from '../../core/user/dto/search-user.dto';
import { UpdateUserDto } from '../../core/user/dto/update-user.dto';
import { Like } from 'typeorm';
import { FriendRespository } from '../../core/friend/friend.repository';
import { Friend } from '../../core/friend/friend.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(FriendRespository)
    private friendRespository: FriendRespository,
  ) {}

  async findUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findUserById(userId: string): Promise<User> {
    return await this.userRepository.findOneBy({ id: userId });
  }

  async findUserByUserName(username: string) {
    const user = await this.userRepository.findOneBy({ username: username });
    if (user) {
      return { isExistUser: true };
    }
    return { isExistUser: false };
  }

  async searchUsers(userSearchData: SearchUserDto): Promise<User[]> {
    if (!userSearchData.username) {
      return await this.userRepository.find();
    }
    return await this.userRepository.find({
      where: { username: Like(`%${userSearchData.username}%`) },
    });
  }

  async updateUserById(
    userId: string,
    updateUserData: UpdateUserDto,
  ): Promise<User> {
    if (
      updateUserData.username &&
      (await this.findUserByUserName(updateUserData.username)).isExistUser
    ) {
      new BadRequestException('이미 존재하는 username');
    }
    await this.userRepository.update(userId, updateUserData);
    return this.findUserById(userId);
  }

  async findFriends(userToken): Promise<Friend[]> {
    return await this.friendRespository.find({
      relations: ['userId', 'userFriendId'],
      where: [
        { userId: { id: userToken.id } },
        { userFriendId: { id: userToken.id } },
      ],
    });
  }

  async requestFriend(userToken, friendId: string): Promise<Friend> {
    if (userToken.id === friendId) {
      throw new BadRequestException('userId === friendId');
    }
    const friend = await this.findUserById(friendId);
    if (!friend) {
      throw new BadRequestException('존재하지 않는 유저');
    }

    const friendship = await this.friendRespository.findFriendByUsers(
      userToken.id,
      friendId,
    );
    console.log(friendship);
    console.log(friendship?.acceptAt);
    if (friendship?.acceptAt) {
      console.log('이미 친구 입니다');
      throw new BadRequestException('이미 친구 입니다');
    } else if (
      !friendship?.acceptAt &&
      friendship?.userId.id === userToken.id
    ) {
      console.log('이미 친구 신청이 되어있습니다');
      throw new BadRequestException('이미 친구 신청이 되어있습니다');
    } else if (
      !friendship?.acceptAt &&
      friendship?.userFriendId.id === userToken.id
    ) {
      console.log('친구 수락');
      await this.friendRespository.update(friendship.id, {
        acceptAt: () => 'CURRENT_TIMESTAMP',
      });
      return friendship;
    }

    console.log('친구 요청 생성');
    const user = await this.findUserById(userToken.id);
    return this.friendRespository.createFriend({
      userId: user,
      userFriendId: friend,
    });
  }

  async acceptFriend(userToken, friendId: string): Promise<Friend> {
    const friendship = await this.friendRespository.findOne({
      relations: ['userId', 'userFriendId'],
      where: { userId: { id: friendId }, userFriendId: { id: userToken.id } },
    });
    if (!friendship) {
      throw new BadRequestException('수락할 요청이 없습니다.');
    }
    if (friendship.acceptAt) {
      throw new BadRequestException('이미 친구 입니다');
    }
    await this.friendRespository.update(friendship.id, {
      acceptAt: () => 'CURRENT_TIMESTAMP',
    });
    return friendship;
  }
}
