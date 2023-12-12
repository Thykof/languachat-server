import { Controller, Get, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { ClassroomService } from './classroom.service';
import { Classroom } from './schemas/classroom.schema';

@Controller('classrooms')
@UseInterceptors(ClassSerializerInterceptor)
export class ClassroomController {
  constructor(private classroomService: ClassroomService) {}

  @Get()
  async findAll() {
    const classrooms = await this.classroomService.findAll();
    return classrooms.map((classroom) => {
      return new Classroom({
        name: classroom.name,
        topic: classroom.topic,
        language: classroom.language,
        level: classroom.level,
        persona: classroom.persona,
      });
    });
  }
}
