import { getRepository, Repository } from 'typeorm';

import { User } from '../../../users/entities/User';
import { Game } from '../../entities/Game';

import { IGamesRepository } from '../IGamesRepository';

export class GamesRepository implements IGamesRepository {
  private repository: Repository<Game>;

  constructor() {
    this.repository = getRepository(Game);
  }

  async findByTitleContaining(param: string): Promise<Game[]> {
    return await this.repository
      .createQueryBuilder("games")
      .where("games.title ilike :title", { title: `%${param}%` })
      .getMany()
  }

  async countAllGames(): Promise<[{ count: string }]> {
    return await this.repository.query("SELECT COUNT(*) FROM games");
  }

  async findUsersByGameId(id: string): Promise<User[]> {
    const users =  await this.repository
      .createQueryBuilder("games")
      .leftJoinAndSelect("games.users", "users")
      .where("games.id = :id", {id})
      .getRawMany()

    const filteredUsers = users.map((user: any) => {
      const newUser = new User()
      
      Object.assign(newUser, {
        id: user.users_id,
        first_name: user.users_first_name,
        last_name: user.users_last_name,
        email: user.users_email,
        created_at: user.users_created_at,
        updated_at: user.users_updated_at
      })

      return newUser
    })

    return filteredUsers
  }
}
