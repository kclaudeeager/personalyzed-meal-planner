import { Controller, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShoppingListsService } from './shopping-lists.service';

class ToggleItemDto {
  isChecked!: boolean;
}

@ApiTags('shopping-lists')
@ApiBearerAuth()
@Controller('shopping-lists')
export class ShoppingListsController {
  constructor(private readonly shoppingListsService: ShoppingListsService) {}

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get shopping lists for a user' })
  async findByUser(@Param('userId') userId: string) {
    const lists = await this.shoppingListsService.findByUser(userId);
    return { success: true, data: lists };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shopping list by ID' })
  async findOne(@Param('id') id: string) {
    const list = await this.shoppingListsService.findById(id);
    return { success: true, data: list };
  }

  @Patch('item/:itemId')
  @ApiOperation({ summary: 'Toggle shopping list item checked state' })
  async toggleItem(@Param('itemId') itemId: string, @Body() dto: ToggleItemDto) {
    const item = await this.shoppingListsService.toggleItem(itemId, dto.isChecked);
    return { success: true, data: item };
  }

  @Get(':id/export')
  @ApiOperation({ summary: 'Export shopping list as plain text' })
  async export(@Param('id') id: string) {
    const text = await this.shoppingListsService.exportAsText(id);
    return { success: true, data: text };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a shopping list' })
  async delete(@Param('id') id: string) {
    await this.shoppingListsService.delete(id);
    return { success: true };
  }
}
