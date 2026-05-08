import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Group } from './group.entity';
import { CreateGroupDto, UpdateGroupDto } from './dto/group.dto';
import { Student, StudentStatus } from '../students/student.entity';
import { Payment } from '../payments/payment.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
  ) {}

  create(dto: CreateGroupDto): Promise<Group> {
    const group = this.groupsRepository.create(dto);
    return this.groupsRepository.save(group);
  }

  findAll(search?: string): Promise<Group[]> {
    if (search) {
      return this.groupsRepository.find({
        where: [
          { subject: ILike(`%${search}%`) },
          { name: ILike(`%${search}%`) },
        ],
        relations: ['teacher', 'students'],
      });
    }
    return this.groupsRepository.find({
      relations: ['teacher', 'students'],
    });
  }

  async findOne(id: number): Promise<Group> {
    const group = await this.groupsRepository.findOne({
      where: { id },
      relations: ['teacher', 'students'],
    });
    if (!group) throw new NotFoundException(`Guruh #${id} topilmadi`);
    return group;
  }

  async update(id: number, dto: UpdateGroupDto): Promise<Group> {
    const group = await this.findOne(id);
    Object.assign(group, dto);
    return this.groupsRepository.save(group);
  }

  async remove(id: number): Promise<{ message: string }> {
    const group = await this.findOne(id);
    await this.groupsRepository.remove(group);
    return { message: "Guruh o'chirildi" };
  }

  async count(): Promise<number> {
    return this.groupsRepository.count({ where: { isActive: true } });
  }

  /**
   * Guruh o'quvchilari ro'yhati + har birining shu oyda to'lov qilgan/qilmaganligi
   * Figma: "Informatika guruhi ro'yhati" sahifasi
   */
  async getGroupStudents(groupId: number) {
    await this.findOne(groupId); // 404 check

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const students = await this.studentsRepository.find({
      where: { groupId, status: StudentStatus.ACTIVE },
      order: { fullName: 'ASC' },
    });

    const result = await Promise.all(
      students.map(async (student, index) => {
        const payment = await this.paymentsRepository.findOne({
          where: { studentId: student.id, month: currentMonth },
        });
        return {
          no: index + 1,
          id: student.id,
          fullName: student.fullName,
          phone: student.phone,
          hasPaid: !!payment,
          paymentId: payment?.id ?? null,
        };
      }),
    );

    return result;
  }

  /**
   * Shu oyda to'lov qilmagan o'quvchilar ro'yhati
   * Figma: "Shu oy bo'yicha to'lov qilmaganlar" bo'limi
   */
  async getUnpaidStudents(groupId: number) {
    await this.findOne(groupId); // 404 check

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const students = await this.studentsRepository.find({
      where: { groupId, status: StudentStatus.ACTIVE },
    });

    const unpaid: Student[] = [];

    for (const student of students) {
      const payment = await this.paymentsRepository.findOne({
        where: { studentId: student.id, month: currentMonth },
      });
      if (!payment) unpaid.push(student);
    }

    return unpaid.map((s, i) => ({
      no: i + 1,
      id: s.id,
      fullName: s.fullName,
      phone: s.phone,
    }));
  }
}
