import { Controller, Get, ClassSerializerInterceptor, UseInterceptors, Post, Body } from '@nestjs/common';
import { ClassroomService } from './classroom.service';
import { Classroom } from './schemas/classroom.schema';
import { CreateClassroomDto } from './dtos/create-classroom.dto';

@Controller('classrooms')
@UseInterceptors(ClassSerializerInterceptor)
export class ClassroomController {
  constructor(private classroomService: ClassroomService) {}

  @Get()
  async findAll() {
    const classrooms = await this.classroomService.findAll();
    return classrooms.map((classroom) => {
      return new Classroom({
        _id: classroom._id,
        name: classroom.name,
        topic: classroom.topic,
        language: classroom.language,
        level: classroom.level,
        persona: classroom.persona,
      });
    });
  }

  @Post()
  async create(@Body() createClassroomDto: CreateClassroomDto): Promise<Classroom> {
    const classroom = await this.classroomService.create(createClassroomDto);
    return new Classroom({
      _id: classroom._id,
      name: classroom.name,
      topic: classroom.topic,
      language: classroom.language,
      level: classroom.level,
      persona: classroom.persona,
    });
  }
}
