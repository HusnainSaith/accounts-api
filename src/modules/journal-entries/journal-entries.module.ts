import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalEntry } from '../companies/entities/journal-entry.entity';
import { JournalEntryLine } from '../companies/entities/journal-entry-line.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JournalEntry, JournalEntryLine])],
  exports: [TypeOrmModule],
})
export class JournalEntriesModule {}