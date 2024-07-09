import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Post()
  create(@Body() createTopicDto: CreateTopicDto) {
    console.log(createTopicDto);
    return this.topicService.create(createTopicDto);
  }

  @Get()
  async findAll() {
    const topics = await this.topicService.findAll();
    return { topics };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.topicService.findOne(id);
  }

  @Get('/topic-questions/:id')
  findQuestionsByTopic(@Param('id') id: string) {
    return this.topicService.findQuestionsByTopic(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto) {
    return this.topicService.update(id, updateTopicDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.topicService.remove(id);
  }

  @Post(':id/follow')
  followTopic(@Param('id') topicId: string, @Body() body: { userId: string }) {
    const { userId } = body;
    return this.topicService.followTopic(userId, topicId);
  }

  @Post(':id/unfollow')
  unfollowTopic(
    @Param('id') topicId: string,
    @Body() body: { userId: string },
  ) {
    const { userId } = body;
    return this.topicService.unfollowTopic(userId, topicId);
  }
}
