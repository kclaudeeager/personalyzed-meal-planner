// =============================================================================
// Meals Controller — REST endpoints for meal catalog
// =============================================================================

import {
  Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, UseInterceptors,
  UploadedFile, UploadedFiles, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { MealsService } from './meals.service';
import {
  CreateMealDto, UpdateMealDto, MealQueryDto,
  GenerateShoppingListDto, ImportRecipeDto, AddVideoDto,
  ParseImageDto, ParseVideoDto, TranslateRecipeDto,
} from './meals.dto';
import { OpenAiRecipeParserService } from './openai-recipe-parser.service';

@ApiTags('meals')
@Controller('meals')
export class MealsController {
  constructor(
    private readonly mealsService: MealsService,
    private readonly openAiParser: OpenAiRecipeParserService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List meals with optional filters' })
  async findAll(@Query() query: MealQueryDto) {
    const result = await this.mealsService.findAll(query);
    return { success: true, ...result };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get meal details with ingredients, nutrition, and videos' })
  async findOne(@Param('id') id: string) {
    const meal = await this.mealsService.findById(id);
    return { success: true, data: meal };
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new meal' })
  async create(@Body() dto: CreateMealDto) {
    const meal = await this.mealsService.create(dto);
    return { success: true, data: meal };
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a meal' })
  async update(@Param('id') id: string, @Body() dto: UpdateMealDto) {
    const meal = await this.mealsService.update(id, dto);
    return { success: true, data: meal };
  }

  @Post(':id/videos')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add one or more preparation video links' })
  async addVideos(@Param('id') id: string, @Body() dtos: AddVideoDto[]) {
    const videos = await this.mealsService.addVideos(id, dtos);
    return { success: true, data: videos };
  }

  @Delete(':id/videos/:videoId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a video link from a meal' })
  async deleteVideo(@Param('videoId') videoId: string) {
    const result = await this.mealsService.deleteVideo(videoId);
    return { success: true, ...result };
  }

  @Post(':id/images')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req: any, file: Express.Multer.File, cb: (err: Error | null, name: string) => void) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req: any, file: Express.Multer.File, cb: (err: Error | null, valid: boolean) => void) => {
        if (!file.mimetype.match(/^image\//)) {
          cb(new BadRequestException('Only image files are allowed'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload multiple meal images (max 10)' })
  async uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) throw new BadRequestException('No files uploaded');
    const images = await this.mealsService.addImages(id, files);
    return { success: true, data: images };
  }

  @Delete(':id/images/:imageId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove an image from a meal' })
  async deleteImage(@Param('imageId') imageId: string) {
    const result = await this.mealsService.deleteImage(imageId);
    return { success: true, ...result };
  }

  @Post(':id/media')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req: any, file: Express.Multer.File, cb: (err: Error | null, name: string) => void) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a single media file (image or video)' })
  async uploadMedia(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title?: string,
    @Body('creatorName') creatorName?: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const result = await this.mealsService.uploadMedia(id, file, title, creatorName);
    return { success: true, ...result };
  }

  @Post('parse-image')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Parse a recipe from an image using OpenAI vision' })
  async parseImage(@Body() dto: ParseImageDto) {
    const result = await this.openAiParser.parseFromImage(dto.imageUrl, dto.title);
    if (!result) return { success: false, message: 'OpenAI not configured (set OPENAI_API_KEY)' };
    return { success: true, data: result };
  }

  @Post('parse-video')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Parse a recipe from a video using OpenAI audio' })
  async parseVideo(@Body() dto: ParseVideoDto) {
    const result = await this.openAiParser.parseFromVideo(dto.videoUrl);
    if (!result) return { success: false, message: 'OpenAI not configured (set OPENAI_API_KEY)' };
    return { success: true, data: result };
  }

  @Post('translate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Translate a recipe to a target language' })
  async translateRecipe(@Body() dto: TranslateRecipeDto) {
    const result = await this.openAiParser.translateRecipe(dto.recipeText, dto.targetLanguage);
    if (!result) return { success: false, message: 'OpenAI not configured (set OPENAI_API_KEY)' };
    return { success: true, data: result };
  }

  @Post('shopping-list')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate a shopping list from a meal plan' })
  async generateShoppingList(@Body() dto: GenerateShoppingListDto) {
    const list = await this.mealsService.generateShoppingList(dto.mealPlanId);
    return { success: true, data: list };
  }

  @Post('import')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Import a recipe from a URL' })
  async importFromUrl(@Body() dto: ImportRecipeDto) {
    const result = await this.mealsService.importFromUrl(dto.url);
    return { success: true, data: result.meal, message: result.message };
  }
}
