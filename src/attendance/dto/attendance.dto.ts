import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { AttendanceStatus } from '../attendance.entity';

export class CreateAttendanceDto {
  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiProperty({ example: 1 })
  @IsNumber()
  studentId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  groupId: number;

  @ApiPropertyOptional({ example: 'Kasalligi sababli' })
  @IsOptional()
  @IsString()
  note?: string;
}

export class BulkAttendanceDto {
  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  groupId: number;

  @ApiProperty({
    example: [{ studentId: 1, status: 'present' }, { studentId: 2, status: 'absent' }],
  })
  records: { studentId: number; status: AttendanceStatus; note?: string }[];
}
