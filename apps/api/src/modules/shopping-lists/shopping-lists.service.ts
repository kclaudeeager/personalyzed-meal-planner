import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ShoppingListsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string) {
    return this.prisma.shoppingList.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const list = await this.prisma.shoppingList.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!list) throw new NotFoundException('Shopping list not found');
    return list;
  }

  async toggleItem(itemId: string, isChecked: boolean) {
    const item = await this.prisma.shoppingListItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Shopping list item not found');
    return this.prisma.shoppingListItem.update({
      where: { id: itemId },
      data: { isChecked },
    });
  }

  async exportAsText(listId: string) {
    const list = await this.findById(listId);
    const lines = [
      `=== ${list.name} ===`,
      `Date: ${new Date().toLocaleDateString()}`,
      `Total: ${list.totalCost.toLocaleString()} RWF`,
      `Items: ${list.items.length}`,
      '',
      '--- Items ---',
      ...list.items.map(
        (item: { isChecked: boolean; ingredientName: string; quantity: number; unit: string; estimatedCost: number }) =>
          `${item.isChecked ? '[x]' : '[ ]'} ${item.ingredientName} — ${item.quantity} ${item.unit} (${item.estimatedCost.toLocaleString()} RWF)`,
      ),
      '',
      `Total Cost: ${list.totalCost.toLocaleString()} RWF`,
    ];
    return lines.join('\n');
  }

  async delete(id: string) {
    await this.prisma.shoppingList.delete({ where: { id } });
  }
}
