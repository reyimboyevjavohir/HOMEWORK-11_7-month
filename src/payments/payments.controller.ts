import {
  Controller, Get, Post, Body, Param, Delete,
  UseGuards, ParseIntPipe, Query,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Payment } from './payment.entity';

@ApiTags("Payments (To'lovlar)")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: "To'lov qo'shish" })
  @ApiResponse({ status: 201, type: Payment })
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  /**
   * Figma: "To'lov qilganlar (shu oy bo'yicha)" jadval + pagination (JAMI 100 ta)
   * ?month=2024-01&page=1&limit=10
   */
  @Get()
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({
    summary: "Barcha to'lovlar (pagination va oy filtri bilan)",
    description:
      "Figmadagi 'To\\'lov qilganlar (shu oy bo\\'yicha)' jadval uchun. " +
      "month, page, limit parametrlari bilan ishlaydi.",
  })
  @ApiQuery({ name: 'month', required: false, example: '2024-01', description: 'YYYY-MM format' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  findAll(
    @Query('month') month?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.paymentsService.findAll(month, parseInt(page), parseInt(limit));
  }

  @Get('student/:studentId')
  @Roles(Role.SUPERADMIN, Role.ADMIN, Role.USER)
  @ApiOperation({ summary: "O'quvchi to'lovlari" })
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.paymentsService.findByStudent(studentId);
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN, Role.ADMIN)
  @ApiOperation({ summary: "To'lovni ID bo'yicha olish" })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: "To'lovni o'chirish (faqat superadmin)" })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.remove(id);
  }
}
