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
import { AnswerService } from './answer.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('answer')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Post()
  create(@Body() createAnswerDto: CreateAnswerDto) {
    return this.answerService.create(createAnswerDto);
  }

  @Get()
  findAll() {
    return this.answerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.answerService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAnswerDto: UpdateAnswerDto) {
    return this.answerService.update(id, updateAnswerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.answerService.remove(id);
  }

  @Post(':answerId/like')
  async likeAnswer(
    @Param('answerId') answerId: string,
    @Body('userId') userId: string,
  ) {
    return this.answerService.likeAnswer(answerId, userId);
  }

  @Post(':answerId/dislike')
  async dislikeAnswer(
    @Param('answerId') answerId: string,
    @Body('userId') userId: string,
  ) {
    return this.answerService.dislikeAnswer(answerId, userId);
  }

  @Get('/others-info/:id')
  getOthersInfo(@Param('id') id: string) {
    return this.answerService.getOthersInfo(id);
  }
}
