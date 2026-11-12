import { Project } from "../../../domain/Project";
import { IProjectRepository } from "../../../application/interfaces/repositories/IProjectRepository";
import { ProjectModel, IProjectDocument } from "../schemas/ProjectSchema";

export class MongoProjectRepository implements IProjectRepository {
  public async save(project: Project): Promise<void> {
    await ProjectModel.findByIdAndUpdate(
      project.getId,
      {
        _id: project.getId,
        title: project.getTitle,
        description: project.getDescription,
        hostId: project.getHostId,
        members: project.getMembers.map((m) => ({
          userId: m.userId,
          label: m.label,
          joinedAt: m.joinedAt
        })),
        createdAt: project.getCreatedAt,
        updatedAt: project.getUpdatedAt
      },
      { upsert: true, new: true }
    );
  }

  public async findById(id: string): Promise<Project | null> {
    const doc = await ProjectModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  public async findByUserId(userId: string): Promise<Project[]> {
    const docs = await ProjectModel.find({
      $or: [{ hostId: userId }, { "members.userId": userId }]
    }).sort({ updatedAt: -1 });

    return docs.map((doc) => this.toDomain(doc));
  }

  public async delete(id: string): Promise<void> {
    await ProjectModel.findByIdAndDelete(id);
  }

  private toDomain(doc: IProjectDocument): Project {
    return new Project({
      id: doc._id,
      title: doc.title,
      description: doc.description,
      hostId: doc.hostId,
      members: doc.members.map((m) => ({
        userId: m.userId,
        label: m.label,
        joinedAt: m.joinedAt
      })),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }
}
