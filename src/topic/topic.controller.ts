import { Get, UseInterceptors, ClassSerializerInterceptor, Controller } from '@nestjs/common';
import { TopicService } from './topic.service';
import { Topic } from './schemas/topic.schema';

@Controller('topics')
@UseInterceptors(ClassSerializerInterceptor)
export class TopicController {
  constructor(private topicService: TopicService) {}

  @Get()
  async findAll() {
    const topics = await this.topicService.findAll();
    return topics.map((topic) => {
      return new Topic({
        _id: topic._id,
        name: topic.name,
        description: topic.description,
      });
    });
  }
}
