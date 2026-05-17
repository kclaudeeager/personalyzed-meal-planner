// =============================================================================
// Users Controller — REST endpoints for user management
// =============================================================================

import { Controller, Get, Patch, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdatePreferencesDto } from './users.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user (called after Clerk registration)' })
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return { success: true, data: user };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile by ID' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.getUserWithPreferences(id);
    return { success: true, data: user };
  }

  @Get('clerk/:clerkId')
  @ApiOperation({ summary: 'Get user by Clerk ID' })
  async findByClerkId(@Param('clerkId') clerkId: string) {
    const user = await this.usersService.findByClerkId(clerkId);
    return { success: true, data: user };
  }

  @Patch(':id/preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  async updatePreferences(
    @Param('id') id: string,
    @Body() dto: UpdatePreferencesDto,
  ) {
    const user = await this.usersService.updatePreferences(id, dto);
    return { success: true, data: user };
  }
}
