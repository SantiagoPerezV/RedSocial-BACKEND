import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    //MongoDB configuración dinámica
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        retryWrites:true,
        dbName: 'TpFinal',
        w: 'majority',
      }),
      inject:[ConfigService],
    }),
    
    AuthModule,
    
    PostsModule,
    
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
