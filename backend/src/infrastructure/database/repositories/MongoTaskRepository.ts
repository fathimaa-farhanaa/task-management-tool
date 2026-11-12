import { Task } from "../../../domain/Task";
import { ITaskRepository } from "../../../application/interfaces/repositories/ITaskRepository";
import { TaskModel, ITaskDocument } from "../schemas/TaskSchema";

export class MongoTaskRepository implements ITaskRepository {
  public async save(task: Task): Promise<void> {
    await TaskModel.findByIdAndUpdate(
      task.getId,
      {
        _id: task.getId,
        title: task.getTitle,
        description: task.getDescription,
        status: task.getStatus,
        labels: task.getLabels,
        type: task.getType,
        ownerId: task.getOwnerId,
        projectId: task.getProjectId,
        assignedToUserId: task.getAssignedToUserId,
        createdAt: task.getCreatedAt,
        updatedAt: task.getUpdatedAt
      },
      { upsert: true, new: true }
    );
  }

  public async findById(id: string): Promise<Task | null> {
    const doc = await TaskModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  public async findPersonalTasksByOwner(ownerId: string): Promise<Task[]> {
    const docs = await TaskModel.find({
      type: "PERSONAL",
      ownerId
    }).sort({ createdAt: -1 });

    return docs.map((doc) => this.toDomain(doc));
  }

  public async findProjectTasks(projectId: string): Promise<Task[]> {
    const docs = await TaskModel.find({
      type: "PROJECT",
      projectId
    }).sort({ createdAt: -1 });

    return docs.map((doc) => this.toDomain(doc));
  }

  public async findAssignedTasksForUser(userId: string): Promise<Task[]> {
    const docs = await TaskModel.find({
      type: "PROJECT",
      assignedToUserId: userId
    }).sort({ updatedAt: -1 });

    return docs.map((doc) => this.toDomain(doc));
  }

  public async unassignAllTasksForMember(projectId: string, memberId: string): Promise<void> {
    await TaskModel.updateMany(
      {
        projectId,
        assignedToUserId: memberId
      },
      {
        $set: {
          assignedToUserId: null,
          updatedAt: new Date()
        }
      }
    );
  }

  public async delete(id: string): Promise<void> {
    await TaskModel.findByIdAndDelete(id);
  }

  public async deleteByProjectId(projectId: string): Promise<void> {
    await TaskModel.deleteMany({ projectId });
  }

  private toDomain(doc: ITaskDocument): Task {
    return new Task({
      id: doc._id,
      title: doc.title,
      description: doc.description,
      status: doc.status,
      labels: doc.labels,
      type: doc.type,
      ownerId: doc.ownerId,
      projectId: doc.projectId,
      assignedToUserId: doc.assignedToUserId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }
}
