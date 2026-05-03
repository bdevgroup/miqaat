import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locations: LocationsService) {}

  @Get()
  list() {
    return this.locations.list();
  }

  @Get('current')
  current() {
    return this.locations.getCurrent();
  }

  @Get('search')
  search(@Query('q') q: string) {
    return this.locations.search(q);
  }

  @Get('ip-lookup')
  ipLookup() {
    return this.locations.ipLookup();
  }

  @Post()
  create(@Body() dto: CreateLocationDto) {
    return this.locations.create({
      name: dto.name,
      city: dto.city,
      country: dto.country,
      lat: dto.lat,
      lng: dto.lng,
      timezone: dto.timezone ?? null,
      makeCurrent: dto.makeCurrent ?? true,
    });
  }

  @Put(':id/current')
  setCurrent(@Param('id', ParseIntPipe) id: number) {
    return this.locations.setCurrent(id);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    this.locations.delete(id);
    return { ok: true };
  }
}
