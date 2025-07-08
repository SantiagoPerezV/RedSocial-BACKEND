import { Module, forwardRef } from '@nestjs/common';
import { EstadisticasController } from './controller/estadisticas.controller';
import { EstadisticasService } from './service/estadisticas.service';

import { PostsModule } from '../posts.module'

@Module({
  imports: [forwardRef(() => PostsModule)], //Importo post module mas que nada para tener las conexiones de mongoosemodule. 
  //forwardref ses utiliza cuando hay dependencia circular, dos modulos dependen de si el uno al otro, esto genera unn error que con esto se soluciona
  controllers: [EstadisticasController],
  providers: [EstadisticasService]
})
export class EstadisticasModule {}
