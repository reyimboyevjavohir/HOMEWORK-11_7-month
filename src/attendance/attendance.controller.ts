import {
  Controller, Get, Post, Body, Param, Delete, UseGuards, ParseIntPipe, Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { BulkAttendanceDto, CreateAttendanceDto } from './dto/attendance.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Attendance (Davomat)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Bitta davomat qo\'shish' })
  create(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.create(dto);
  }

  @Post('bulk')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Guruh uchun davomat (bir kunda barchasi)' })
  bulkCreate(@Body() dto: BulkAttendanceDto) {
    return this.attendanceService.bulkCreate(dto);
  }

  @Get('group/:groupId')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'Guruh davomati' })
  @ApiQuery({ name: 'date', required: false, example: '2024-01-15' })
  findByGroup(
    @Param('groupId', ParseIntPipe) groupId: number,
    @Query('date') date?: string,
  ) {
    return this.attendanceService.findByGroup(groupId, date);
  }

  @Get('student/:studentId')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  @ApiOperation({ summary: 'O\'quvchi davomati' })
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.attendanceService.findByStudent(studentId);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Davomatni o\'chirish' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.remove(id);
  }
}
