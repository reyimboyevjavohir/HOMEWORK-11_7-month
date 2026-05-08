import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { GroupsModule } from './groups/groups.module';
import { PaymentsModule } from './payments/payments.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { User } from './users/user.entity';
import { Student } from './students/student.entity';
import { Teacher } from './teachers/teacher.entity';
import { Group } from './groups/group.entity';
import { Payment } from './payments/payment.entity';
import { Attendance } from './attendance/attendance.entity';
import { Complaint } from './complaints/complaint.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', 'yourpassword'),
        database: config.get('DB_NAME', 'crm_db'),
        entities: [User, Student, Teacher, Group, Payment, Attendance, Complaint],
        synchronize: false,
        logging: false,
      }),
    }),
    AuthModule,
    UsersModule,
    StudentsModule,
    TeachersModule,
    GroupsModule,
    PaymentsModule,
    AttendanceModule,
    ComplaintsModule,
    DashboardModule,
  ],
})
export class AppModule {}
