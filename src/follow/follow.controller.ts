import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { FollowService } from './follow.service';
import { CreateFollowDto } from './dto/create-follow.dto';

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post()
  create(@Body() createFollowDto: CreateFollowDto) {
    return this.followService.create(createFollowDto);
  }

  @Get()
  findAll() {
    return this.followService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.followService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.followService.remove(id);
  }
}
