import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { CreatePaymentDto } from './dto/payment.dto';

export interface PaginatedPayments {
  data: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
  ) {}

  create(dto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentsRepository.create(dto);
    return this.paymentsRepository.save(payment);
  }

  async findAll(month?: string, page = 1, limit = 10): Promise<PaginatedPayments> {
    const skip = (page - 1) * limit;

    const qb = this.paymentsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.student', 'student')
      .leftJoinAndSelect('student.group', 'group')
      .leftJoinAndSelect('group.teacher', 'teacher')
      .orderBy('p.paidAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (month) {
      qb.where('p.month = :month', { month });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['student', 'student.group', 'student.group.teacher'],
    });
    if (!payment) throw new NotFoundException(`To'lov #${id} topilmadi`);
    return payment;
  }

  async findByStudent(studentId: number): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { studentId },
      order: { paidAt: 'DESC' },
    });
  }

  async findByMonth(month: string): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { month },
      relations: ['student', 'student.group', 'student.group.teacher'],
    });
  }

  async getTotalByMonth(month: string): Promise<number> {
    const result = await this.paymentsRepository
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where('p.month = :month', { month })
      .getRawOne();
    return parseFloat(result?.total || '0');
  }

  async remove(id: number): Promise<{ message: string }> {
    const payment = await this.findOne(id);
    await this.paymentsRepository.remove(payment);
    return { message: "To'lov o'chirildi" };
  }

  /**
   * Figma: "To'lov qilish" formasi uchun — o'quvchini topib, guruh va o'qituvchisini qaytarish
   */
  async getStudentInfo(studentId: number) {
    const payment = await this.paymentsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.student', 'student')
      .leftJoinAndSelect('student.group', 'group')
      .leftJoinAndSelect('group.teacher', 'teacher')
      .where('p.studentId = :studentId', { studentId })
      .orderBy('p.paidAt', 'DESC')
      .getOne();
    return payment;
  }
}
