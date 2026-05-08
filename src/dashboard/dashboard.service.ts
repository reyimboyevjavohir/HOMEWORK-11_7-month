import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student, StudentStatus } from '../students/student.entity';
import { Teacher } from '../teachers/teacher.entity';
import { Group } from '../groups/group.entity';
import { Payment } from '../payments/payment.entity';
import { Complaint, ComplaintStatus } from '../complaints/complaint.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Student)   private studentsRepo: Repository<Student>,
    @InjectRepository(Teacher)   private teachersRepo: Repository<Teacher>,
    @InjectRepository(Group)     private groupsRepo: Repository<Group>,
    @InjectRepository(Payment)   private paymentsRepo: Repository<Payment>,
    @InjectRepository(Complaint) private complaintsRepo: Repository<Complaint>,
  ) {}

  async getStats() {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay  = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [totalStudents, totalTeachers, totalGroups, newComplaints] = await Promise.all([
      this.studentsRepo.count({ where: { status: StudentStatus.ACTIVE } }),
      this.teachersRepo.count({ where: { isActive: true } }),
      this.groupsRepo.count({ where: { isActive: true } }),
      this.complaintsRepo.count({ where: { status: ComplaintStatus.NEW } }),
    ]);

    const leftThisMonth = await this.studentsRepo
      .createQueryBuilder('s')
      .where('s.status = :status', { status: StudentStatus.LEFT })
      .andWhere('s.leftDate BETWEEN :start AND :end', { start: firstDay, end: lastDay })
      .getCount();

    // Shu oylik umumiy to'lovlar summasi
    const revenueResult = await this.paymentsRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where('p.month = :month', { month: currentMonth })
      .getRawOne();
    const monthlyRevenue = parseFloat(revenueResult?.total || '0');

    return {
      totalStudents,
      totalTeachers,
      totalGroups,
      newComplaints,
      leftThisMonth,
      monthlyRevenue,
    };
  }

  async getMonthlyChart() {
    const months: Array<{
      month: string;
      totalStudents: number;
      leftStudents: number;
      revenue: number;
    }> = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date  = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year  = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const label = `${year}-${month}`;

      const firstDay = new Date(year, date.getMonth(), 1);
      const lastDay  = new Date(year, date.getMonth() + 1, 0);

      const [totalStudents, leftStudents, revenueResult] = await Promise.all([
        this.studentsRepo
          .createQueryBuilder('s')
          .where('s.createdAt <= :lastDay', { lastDay })
          .andWhere('s.status = :status', { status: StudentStatus.ACTIVE })
          .getCount(),
        this.studentsRepo
          .createQueryBuilder('s')
          .where('s.status = :status', { status: StudentStatus.LEFT })
          .andWhere('s.leftDate BETWEEN :start AND :end', { start: firstDay, end: lastDay })
          .getCount(),
        this.paymentsRepo
          .createQueryBuilder('p')
          .select('SUM(p.amount)', 'total')
          .where('p.month = :label', { label })
          .getRawOne(),
      ]);

      months.push({
        month: label,
        totalStudents,
        leftStudents,
        revenue: parseFloat(revenueResult?.total || '0'),
      });
    }

    return months;
  }
}
