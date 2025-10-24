using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RealEstate.Repository.Migrations
{
    /// <inheritdoc />
    public partial class CleanUp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Images_Listings_ListingId",
                table: "Images");

            migrationBuilder.DropForeignKey(
                name: "FK_Images_Properties_PropertyId",
                table: "Images");

            migrationBuilder.DropForeignKey(
                name: "FK_Listings_Images_FloorPlanId",
                table: "Listings");

            migrationBuilder.DropIndex(
                name: "IX_Listings_FloorPlanId",
                table: "Listings");

            migrationBuilder.DropIndex(
                name: "IX_Listings_PropertyId_Available",
                table: "Listings");

            migrationBuilder.DropIndex(
                name: "IX_Images_PropertyId_ListingId_Type",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "FloorPlanId",
                table: "Listings");

            migrationBuilder.DropColumn(
                name: "Caption",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "IsPrimary",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "FloorPlanPins");

            migrationBuilder.DropColumn(
                name: "Label",
                table: "FloorPlanPins");

            migrationBuilder.RenameColumn(
                name: "ViewAngle",
                table: "Images",
                newName: "Label");

            migrationBuilder.AlterColumn<string>(
                name: "Url",
                table: "Images",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(1024)",
                oldMaxLength: 1024);

            migrationBuilder.AlterColumn<int>(
                name: "SortOrder",
                table: "Images",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "MimeType",
                table: "Images",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FileName",
                table: "Images",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(260)",
                oldMaxLength: 260,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Listings_PropertyId",
                table: "Listings",
                column: "PropertyId");

            migrationBuilder.CreateIndex(
                name: "IX_Images_PropertyId",
                table: "Images",
                column: "PropertyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Images_Listings_ListingId",
                table: "Images",
                column: "ListingId",
                principalTable: "Listings",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Images_Properties_PropertyId",
                table: "Images",
                column: "PropertyId",
                principalTable: "Properties",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Images_Listings_ListingId",
                table: "Images");

            migrationBuilder.DropForeignKey(
                name: "FK_Images_Properties_PropertyId",
                table: "Images");

            migrationBuilder.DropIndex(
                name: "IX_Listings_PropertyId",
                table: "Listings");

            migrationBuilder.DropIndex(
                name: "IX_Images_PropertyId",
                table: "Images");

            migrationBuilder.RenameColumn(
                name: "Label",
                table: "Images",
                newName: "ViewAngle");

            migrationBuilder.AddColumn<Guid>(
                name: "FloorPlanId",
                table: "Listings",
                type: "uuid",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Url",
                table: "Images",
                type: "character varying(1024)",
                maxLength: 1024,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<int>(
                name: "SortOrder",
                table: "Images",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "MimeType",
                table: "Images",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "FileName",
                table: "Images",
                type: "character varying(260)",
                maxLength: 260,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Caption",
                table: "Images",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPrimary",
                table: "Images",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "FloorPlanPins",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Label",
                table: "FloorPlanPins",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Listings_FloorPlanId",
                table: "Listings",
                column: "FloorPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_Listings_PropertyId_Available",
                table: "Listings",
                columns: new[] { "PropertyId", "Available" });

            migrationBuilder.CreateIndex(
                name: "IX_Images_PropertyId_ListingId_Type",
                table: "Images",
                columns: new[] { "PropertyId", "ListingId", "Type" });

            migrationBuilder.AddForeignKey(
                name: "FK_Images_Listings_ListingId",
                table: "Images",
                column: "ListingId",
                principalTable: "Listings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Images_Properties_PropertyId",
                table: "Images",
                column: "PropertyId",
                principalTable: "Properties",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Listings_Images_FloorPlanId",
                table: "Listings",
                column: "FloorPlanId",
                principalTable: "Images",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
