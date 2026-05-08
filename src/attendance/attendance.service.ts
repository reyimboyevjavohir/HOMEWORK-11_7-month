import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './attendance.entity';
import { BulkAttendanceDto, CreateAttendanceDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  create(dto: CreateAttendanceDto): Promise<Attendance> {
    const record = this.attendanceRepository.create(dto);
    return this.attendanceRepository.save(record);
  }

  async bulkCreate(dto: BulkAttendanceDto): Promise<Attendance[]> {
    const records = dto.records.map((r) =>
      this.attendanceRepository.create({
        date: new Date(dto.date),
        groupId: dto.groupId,
        studentId: r.studentId,
        status: r.status,
        note: r.note,
      }),
    );
    return this.attendanceRepository.save(records);
  }

  findByGroup(groupId: number, date?: string): Promise<Attendance[]> {
    const query = this.attendanceRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.student', 'student')
      .where('a.groupId = :groupId', { groupId });
    if (date) query.andWhere('a.date = :date', { date });
    return query.orderBy('a.date', 'DESC').getMany();
  }

  findByStudent(studentId: number): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { studentId },
      order: { date: 'DESC' },
    });
  }

  async remove(id: number): Promise<{ message: string }> {
    const record = await this.attendanceRepository.findOne({ where: { id } });
    if (!record) throw new NotFoundException(`Davomat #${id} topilmadi`);
    await this.attendanceRepository.remove(record);
    return { message: 'Davomat o\'chirildi' };
  }
}
